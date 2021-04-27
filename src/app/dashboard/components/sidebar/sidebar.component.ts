import { Component, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { GuildService } from '../../../services/guild.service';
import { MatDrawer } from '@angular/material/sidenav';
import { Args, WSService } from 'src/app/services/ws.service';
import { RTCService } from 'src/app/services/rtc.service';
import { ChannelService } from 'src/app/services/channel.service';
import { Lean } from 'src/app/types/entity-types';
import { ActivatedRoute, Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';
import { PingService } from 'src/app/services/ping.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateGuildComponent } from 'src/app/dialog/create-guild/create-guild.component';
import { LogService } from 'src/app/services/log.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;

  get guilds() { return this.guildService.guilds || []; }
  get user() { return this.usersService.user; }

  constructor(
    private route: ActivatedRoute,
    public channelService: ChannelService,
    public guildService: GuildService,
    private sounds: SoundService,
    private pings: PingService,
    private usersService: UsersService,
    private log: LogService,
    private router: Router,
    private ws: WSService,
    private dialog: MatDialog,
  ) {}

  async ngOnInit() {
    await this.channelService.init();
    await this.guildService.init();
    
    this.hookWSEvents();
  }

  public hookWSEvents() {
    this.ws
      .on('ADD_FRIEND', this.addFriend, this)
      .on('GUILD_JOIN', this.joinGuild, this)
      .on('MESSAGE_CREATE', this.ping, this)
      .on('REMOVE_FRIEND', this.updateFriends, this)
      .on('PRESENCE_UPDATE', this.updatePresence, this);  
  }

  public async addFriend({ sender, friend, dmChannel }: Args.AddFriend) {
    this.updateFriends({ sender, friend });
    if (dmChannel)
      this.channelService.dmChannels.push(dmChannel);
  }
  public updateFriends({ sender, friend }: { sender: Lean.User, friend: Lean.User }) {
    this.usersService.upsertCached(sender._id, sender);
    this.usersService.upsertCached(friend._id, friend);
  }

  public async joinGuild({ guild }: Args.GuildJoin) {
    this.guildService.guilds.push(guild);
    this.router.navigate([`/channels/${guild._id}`]);

    await this.sounds.success();
  }
  private async ping({ message }: Args.MessageCreate) {
    const guild = this.guildService.getGuildFromChannel(message.channelId);
    if (this.pings.isIgnored(message, guild?._id)) return;

    const activeChannelId = this.route.snapshot.paramMap.get('channelId');
    (activeChannelId === message.channelId)
      ? this.pings.markAsRead(message.channelId)
      : await this.pings.add(message.channelId, message._id);
  }
  private updatePresence({ userId, status }: Args.PresenceUpdate) {    
    const user = this.usersService.getKnown(userId);
    user.status = status;
  }

  public toggle() {
    const icon = document.querySelector('#nav-icon1');
    icon.classList.toggle('open');
    this.drawer.toggle();
  }

  public createGuildDialog() {
    this.dialog.open(CreateGuildComponent, {
      width: '500px',
    });
  }
}
