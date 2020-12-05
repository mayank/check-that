import { MinLength, IsUrl, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class HttpValidator {
    @IsUrl()
    url: string;
}

export class AddServiceDTO {

    @MinLength(5)
    name: string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => HttpValidator)
    query: HttpValidator;
}
