using ExpenseTracker.Core.Dtos.Users;
using ExpenseTracker.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IdentityController : ControllerBase
    {
        private readonly IIdentityService _identityService;

        public IdentityController(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterUserDto dto)
        {
            var result = await _identityService.RegisterAsync(dto);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
            
            return Ok(result.Data);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _identityService.LoginAsync(dto);
            if (!result.Succeeded)
                return Unauthorized(result.Errors);

            return Ok(result.Data);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var result = await _identityService.ChangePasswordAsync(User, dto);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var result = await _identityService.ForgotPasswordAsync(dto);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var result = await _identityService.ResetPasswordAsync(dto);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(RefreshTokenDto dto)
        {
            var result = await _identityService.RefreshTokenAsync(dto);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(result.Data);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var result = await _identityService.LogoutAsync(User);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok();
        }
    }
}