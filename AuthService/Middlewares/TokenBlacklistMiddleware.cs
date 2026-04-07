using System.IdentityModel.Tokens.Jwt;
using AuthService.Services;

namespace AuthService.Middlewares
{
    public class TokenBlacklistMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenBlacklistMiddleware(RequestDelegate next)
        {
            _next = next;
        }

    }
}