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
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileStorage,
    RequestPath = "/userFiles"
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
