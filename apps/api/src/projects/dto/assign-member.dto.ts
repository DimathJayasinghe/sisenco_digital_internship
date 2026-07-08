import { IsUUID } from 'class-validator';

export class AssignMemberDto {
  @IsUUID()
  readonly userId!: string;
}
