import { Observable } from 'rxjs';

export interface MailerService {
  createSendMailJob(payload: CreateJobInput): Observable<CreateJobResponse>;
}

export interface CreateJobInput {
  destination: string;
  templateId: string;
  values: string[];
}

export interface MailerError {
  code: number;
  message: string;
}

export interface EnvelopeObject {
  from: string;
  to: string;
}

export interface CreateJobResponse {
  accepted: string[];
  rejected: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: EnvelopeObject;
  messageId: string;
}
