using Microsoft.AspNetCore.Mvc;
using MtgCommanderHealth.Server.Persistence;

namespace MtgCommanderHealth.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommanderSoundsController : ControllerBase
    {
        private readonly IGameStateRepository stateRepository;
        public CommanderSoundsController(IGameStateRepository stateRepository)
        {
            this.stateRepository = stateRepository;
        }

        [HttpGet("Sounds")]
        public async Task<ActionResult<Dictionary<int, CommanderSounds>>> GetSoundsByCommanderId()
        {
            return Ok(await stateRepository.GetSoundsByCommanderId());
        }
        //TODO: register, upload, set
        [HttpPost]
        public async Task UploadFile(IFormFile soundClip)
        {
            soundClip.OpenReadStream();
        }
        [HttpPost("attackSound/{commanderId}")]
        public async Task<ActionResult> SetCommanderAttackSound(int commanderId, [FromBody] string relPath)
        {
            //await stateRepository.SetCommanderAttackSound(commanderId, relPath);
            return Ok();
        }
    }
}
