using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Primitives;

namespace MtgCommanderHealth.Server
{
    public interface IRootedFileProvider:IFileProvider
    {
        public string Root {  get; }
    }
    public class AppDataFileStorageFileProvider : IRootedFileProvider
    {
        const string AppDataKey = "AppData";
        private readonly PhysicalFileProvider implementThrough;
        public AppDataFileStorageFileProvider()
        {
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(AppDataKey)))
            {
                throw new DirectoryNotFoundException($"unable to find %{AppDataKey}%");
            }
            var folderPath = Environment.ExpandEnvironmentVariables(
                $"%{AppDataKey}%{Path.DirectorySeparatorChar}MtgCommanderHealth"
            );
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            implementThrough = new PhysicalFileProvider(folderPath);
        }
        public string Root => implementThrough.Root;
        public IDirectoryContents GetDirectoryContents(string subpath) 
            => implementThrough.GetDirectoryContents(subpath);

        public IFileInfo GetFileInfo(string subpath)
            => implementThrough.GetFileInfo(subpath);

        public IChangeToken Watch(string filter)
            => implementThrough.Watch(filter);
    }
}
