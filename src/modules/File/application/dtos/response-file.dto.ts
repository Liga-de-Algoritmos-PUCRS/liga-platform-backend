import { ApiProperty } from "@nestjs/swagger";

export abstract class FileReponseDTO {
  @ApiProperty({
    example: "cl9j0d6f90000l3rmn1g6v6y2",
    description: "Unique identifier for the file",
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    example: "document.pdf",
    description: "Name of the file",
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    example: 204800,
    description: "Size of the file in bytes",
    required: true,
    type: Number,
  })
  size: number;

  @ApiProperty({
    example: "application/pdf",
    description: "MIME type of the file",
    required: true,
    type: String,
  })
  type: string;

  @ApiProperty({
    example: "https://example.com/files/document.pdf",
    description: "URL where the file is stored",
    required: true,
    type: String,
  })
  fileUrl: string;

  @ApiProperty({
    example: "cl9j0a8b80000l3rmn0h4x4z5",
    description: "Unique identifier for the author of the file",
    required: true,
    type: String,
  })
  authorId: string;

  @ApiProperty({
    example: "2024-01-01T12:00:00Z",
    description: "Timestamp when the file was created",
    required: true,
    type: String,
    format: "date-time",
  })
  createdAt: Date;

  @ApiProperty({
    example: false,
    description: "Indicates whether the file has been deleted",
    required: true,
    type: Boolean,
  })
  deleted: boolean;

  @ApiProperty({
    example: "2024-02-01T12:00:00Z",
    description: "Timestamp when the file was deleted",
    required: false,
    nullable: true,
    type: String,
    format: "date-time",
  })
  deletedAt?: Date | null;
}
