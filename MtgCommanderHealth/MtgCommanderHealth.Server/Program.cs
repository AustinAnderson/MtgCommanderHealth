using Microsoft.Extensions.FileProviders;
using MtgCommanderHealth.Server;
using MtgCommanderHealth.Server.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IGameStateRepository, FileGameStateRepository>();
var fileStorage = new AppDataFileStorageFileProvider();
builder.Services.AddSingleton<IRootedFileProvider>(fileStorage);

var app = builder.Build();

app.UseDefaultFiles();
#if DEBUG
var currentPath=new FileInfo(builder.Environment.ContentRootPath);
var clientName = "mtgcommanderhealth.client";
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider( 
        Path.Combine(currentPath.Directory!.FullName,clientName,"dist",clientName)
    )
});
#else
app.UseStaticFiles();
#endif
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileStorage,
    RequestPath = "/userFiles"
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
