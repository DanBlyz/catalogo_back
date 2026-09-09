import { PartialType } from "@nestjs/swagger";
import { CreateMarcaDto } from "./create-marca.dto.js";

export class UpdateMarcaDto extends PartialType(CreateMarcaDto) { }