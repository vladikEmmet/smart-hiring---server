import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class RefreshJwtGuard implements CanActivate {
    constructor(private JwtService: JwtService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokensFromHeader(request);
        if(!token) throw new UnauthorizedException("Unauthorized");
        try {
            const payload = await this.JwtService.verifyAsync(token, {
                secret: process.env.JWT_REFRESH,
            });
            request["user"] = payload;
        } catch {
            throw new UnauthorizedException("Unauthorized");
        }

        return true;
    }

    private extractTokensFromHeader(request: Request) {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Refresh" ? token : undefined;
    }
}