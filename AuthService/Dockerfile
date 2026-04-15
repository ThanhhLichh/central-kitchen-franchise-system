# ==========================================
# STAGE 1: BUILD (Sử dụng SDK để biên dịch code)
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file .csproj vào trước và restore các thư viện (Nuget packages)
# giúp Docker cache lại các thư viện, lần build sau sẽ cực kỳ nhanh
COPY ["AuthService.csproj", "./"]
RUN dotnet restore "./AuthService.csproj"

# Copy toàn bộ mã nguồn còn lại vào và tiến hành Publish (đóng gói bản Release)
COPY . .
RUN dotnet publish "AuthService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==========================================
# STAGE 2: RUNTIME (Môi trường chạy thực tế)
# ==========================================
# Chỉ sử dụng bản ASP.NET Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Mở cổng 8080 để giao tiếp bên ngoài
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# Copy kết quả đã build từ STAGE 1 sang STAGE 2
COPY --from=build /app/publish .

# Lệnh khởi chạy ứng dụng khi Container chạy
ENTRYPOINT ["dotnet", "AuthService.dll"]