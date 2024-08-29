using Microsoft.AspNetCore.Mvc;
using MtgCommanderHealth.Server.Persistence;

namespace MtgCommanderHealth.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommanderSoundsController : ControllerBase
    {
        private readonly IGameStateRepository stateRepository;
        private readonly IRootedFileProvider contentFiles;

        public CommanderSoundsController(IGameStateRepository stateRepository, IRootedFileProvider contentFiles)
        {
            this.stateRepository = stateRepository;
            this.contentFiles = contentFiles;
        }

        [HttpGet("Sounds")]
        public async Task<ActionResult<Dictionary<int, CommanderSounds>>> GetSoundsByCommanderId()
        {
            return Ok(await stateRepository.GetSoundsByCommanderId());
        }
        //TODO: register, upload, set
        [HttpPost("uploadSound")]
        public async Task UploadFile(IFormFile soundClip)
        {
            var fileInf = new FileInfo(Path.Combine(contentFiles.Root, "stored/test.bmp"));
            var dir = fileInf.Directory;
            if(dir == null)
            {
                //whack it away because hard coding subfolder path above, need to handle if moved out to settings
                dir = new DirectoryInfo(Path.GetDirectoryName(fileInf.FullName)!);
            }
            if(!dir.Exists)
            {
                dir.Create();
            }
            await using var file = fileInf.OpenWrite();
            await soundClip.OpenReadStream().CopyToAsync(file);
        }
        [HttpPost("attackSound/{commanderId}")]
        public async Task<ActionResult> SetCommanderAttackSound(int commanderId, [FromBody] string relPath)
        {
            //stateRepository.sou
            //await stateRepository.SetCommanderAttackSound(commanderId, relPath);
            return Ok();
        }
    }
}
