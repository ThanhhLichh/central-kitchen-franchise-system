# ── Stage 1: Build ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# ✅ Fix lỗi NuGet fallback folder trỏ về Windows path
ENV NUGET_FALLBACK_PACKAGES=""

COPY ["Production Service.csproj", "."]
RUN dotnet restore "Production Service.csproj"

COPY . .

RUN dotnet publish "Production Service.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Stage 2: Runtime ────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Production Service.dll"]