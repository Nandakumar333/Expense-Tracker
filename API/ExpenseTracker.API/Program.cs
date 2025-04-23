using ExpenseTracker.API.Extensions;
using ExpenseTracker.DAL.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // This will now use our enhanced Swagger configuration
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Custom Services
builder.Services.AddJwtAuthentication(builder.Configuration); // JWT authentication
builder.Services.ConfigureServices(builder.Configuration);
builder.Services.ConfigureRepositories();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ExpenseTracker API v1");
    });
}

// Custom Middleware
app.AddAppMiddlewares();

app.UseHttpsRedirection();

// The order is important here
app.UseAuthentication(); // Must come before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
