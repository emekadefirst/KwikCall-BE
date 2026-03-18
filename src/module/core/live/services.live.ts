import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { EventRepository } from '../event/repository.event';
import { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } from '../../../configs/env.configs';

export class LiveService {
  private eventRepo = new EventRepository();
  private roomService = new RoomServiceClient(LIVEKIT_URL!, LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!);

  async startSession(shortCode: string, hostId: string) {
    const event = await this.eventRepo.findOne(shortCode, hostId);
    if (!event) throw new Error("Unauthorized or Event not found");

    await this.eventRepo.update(event.id, { 
      status: 'LIVE', 
      actualStartedAt: new Date() 
    });

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: hostId,
      name: event.title,
    });

    at.addGrant({ 
      roomJoin: true, 
      room: event.id, 
      canPublish: true, 
      canSubscribe: true 
    });

    return { token: await at.toJwt(), serverUrl: LIVEKIT_URL };
  }

  async joinSession(shortCode: string, userId: string) {
    const event = await this.eventRepo.findOne(shortCode);
    if (!event) throw new Error("Stream is not live");

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
    });

    at.addGrant({ 
      roomJoin: true, 
      room: event.id, 
      canPublish: false, 
      canSubscribe: true 
    });

    return { token: await at.toJwt(), serverUrl: LIVEKIT_URL };
  }

  async endSession(shortCode: string, hostId: string) {
    const event = await this.eventRepo.findOne( shortCode, hostId );
    if (!event) throw new Error("Unauthorized: You are not the host");

    await this.eventRepo.update(event.id, { 
      status: 'ENDED', 
      endTime: new Date() 
    });

    // Clean up the SFU room
    await this.roomService.deleteRoom(event.id);
    return { success: true };
  }
}