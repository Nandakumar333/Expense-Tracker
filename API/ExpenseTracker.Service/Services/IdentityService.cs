using ExpenseTracker.Core.Dtos.Users;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Data;
using ExpenseTracker.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BC = BCrypt.Net.BCrypt;

namespace ExpenseTracker.Service.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public IdentityService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ServiceResult> RegisterAsync(RegisterUserDto dto)
        {
            try
            {
                var existingUser = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Profile.Email == dto.Email);
                if (existingUser != null)
                {
                    return new ServiceResult
                    {
                        Succeeded = false,
                        Errors = new[] { "User with this email already exists" }
                    };
                }

                var user = new UserEntity
                {
                    Username = dto.Email,
                    PasswordHash = BC.HashPassword(dto.Password),
                    CreatedAt = DateTime.UtcNow,
                    Profile = new UserProfileEntity
                    {
                        FirstName = dto.FirstName,
                        LastName = dto.LastName,
                        Email = dto.Email,
                        CreatedAt = DateTime.UtcNow
                    },
                    Settings = new UserSettingsEntity
                    {
                        Currency = "USD",
                        Language = "en-US",
                        Theme = "light",
                        TimeZone = TimeZoneInfo.Local.Id,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return new ServiceResult
                {
                    Succeeded = true,
                    Data = new { UserId = user.Id }
                };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Registration failed", ex.Message }
                };
            }
        }

        public async Task<ServiceResult> LoginAsync(LoginDto dto)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .Include(u => u.Settings)
                    .FirstOrDefaultAsync(u => u.Profile.Email == dto.Email);

                if (user == null || !BC.Verify(dto.Password, user.PasswordHash))
                {
                    return new ServiceResult
                    {
                        Succeeded = false,
                        Errors = new[] { "Invalid email or password" }
                    };
                }

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                user.LastLogin = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new ServiceResult
                {
                    Succeeded = true,
                    Data = new
                    {
                        Token = token,
                        RefreshToken = refreshToken,
                        User = new UserDto
                        {
                            Id = user.Id,
                            Email = user.Profile.Email,
                            FirstName = user.Profile.FirstName,
                            LastName = user.Profile.LastName,
                            DefaultCurrency = user.Settings.Currency,
                            TimeZone = user.Settings.TimeZone,
                            Language = user.Settings.Language
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Login failed", ex.Message }
                };
            }
        }

        public async Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal user, ChangePasswordDto dto)
        {
            try
            {
                var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userEntity = await _context.Users.FindAsync(userId);

                if (userEntity == null || !BC.Verify(dto.CurrentPassword, userEntity.PasswordHash))
                {
                    return new ServiceResult
                    {
                        Succeeded = false,
                        Errors = new[] { "Current password is incorrect" }
                    };
                }

                userEntity.PasswordHash = BC.HashPassword(dto.NewPassword);
                userEntity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new ServiceResult { Succeeded = true };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Password change failed", ex.Message }
                };
            }
        }

        public async Task<ServiceResult> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Profile.Email == dto.Email);

                if (user == null)
                    return new ServiceResult { Succeeded = true };

                user.ResetPasswordToken = GeneratePasswordResetToken();
                user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(24);

                await _context.SaveChangesAsync();

                // TODO: send token via email

                return new ServiceResult { Succeeded = true };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Password reset request failed", ex.Message }
                };
            }
        }

        public async Task<ServiceResult> ResetPasswordAsync(ResetPasswordDto dto)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Profile.Email == dto.Email);

                if (user == null || user.ResetPasswordToken != dto.Token || user.ResetPasswordTokenExpiry < DateTime.UtcNow)
                {
                    return new ServiceResult
                    {
                        Succeeded = false,
                        Errors = new[] { "Invalid or expired reset token" }
                    };
                }

                user.PasswordHash = BC.HashPassword(dto.NewPassword);
                user.ResetPasswordToken = null;
                user.ResetPasswordTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new ServiceResult { Succeeded = true };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Password reset failed", ex.Message }
                };
            }
        }

        public async Task<ServiceResult> RefreshTokenAsync(RefreshTokenDto dto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

                if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                {
                    return new ServiceResult
                    {
                        Succeeded = false,
                        Errors = new[] { "Invalid or expired refresh token" }
                    };
                }

                var token = GenerateJwtToken(user);
                var newRefreshToken = GenerateRefreshToken();

                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await _context.SaveChangesAsync();

                return new ServiceResult
                {
                    Succeeded = true,
                    Data = new { Token = token, RefreshToken = newRefreshToken }
                };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Token refresh failed", ex.Message }
                };
            }
        }

        public async Task<ServiceResult> LogoutAsync(ClaimsPrincipal user)
        {
            try
            {
                var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userEntity = await _context.Users.FindAsync(userId);

                if (userEntity != null)
                {
                    userEntity.RefreshToken = null;
                    userEntity.RefreshTokenExpiryTime = null;
                    await _context.SaveChangesAsync();
                }

                return new ServiceResult { Succeeded = true };
            }
            catch (Exception ex)
            {
                return new ServiceResult
                {
                    Succeeded = false,
                    Errors = new[] { "Logout failed", ex.Message }
                };
            }
        }

        private string GenerateJwtToken(UserEntity user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Profile.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        private string GeneratePasswordResetToken()
        {
            var randomBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }
    }
}