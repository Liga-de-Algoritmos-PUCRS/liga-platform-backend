import { PartialType } from '@nestjs/swagger';
import { CreateProblemDTO } from './create-problem.dto';

export class UpdateProblemDTO extends PartialType(CreateProblemDTO) {}
