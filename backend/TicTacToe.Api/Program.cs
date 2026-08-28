using TicTacToe.Api.Services;

var builder =
    WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ScoreboardService>();
builder.Services.AddSingleton<GameService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Angular",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Angular");

app.MapControllers();

app.Run();