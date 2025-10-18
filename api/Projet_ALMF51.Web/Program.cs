using Projet_ALMF51.Web.DependencyInjection;
using Scalar.AspNetCore;
using Projet_ALMF51.Presentation.bfs;

const string MyAllowSpecificOrigins = "MyAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins(builder.Configuration["AppBaseUrl"])
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                      });
});


builder.RegisterApplicationServices();

var app = builder.Build();

app.UseCors(MyAllowSpecificOrigins);

app.MapGet("/", () => Results.Ok("OK"));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

//app.UseHttpsRedirection();

app.MapBFSEndpoint();

app.Run();
