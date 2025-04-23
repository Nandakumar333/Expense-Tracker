using ExpenseTracker.Core.Dtos.Users;
using ExpenseTracker.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var profile = await _userService.GetUserProfileAsync(userId);
            if (profile == null)
                return NotFound();
            
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateUserProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.UpdateUserProfileAsync(userId, dto);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var settings = await _userService.GetUserSettingsAsync(userId);
            if (settings == null)
                return NotFound();

            return Ok(settings);
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings(UpdateUserSettingsDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.UpdateUserSettingsAsync(userId, dto);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}