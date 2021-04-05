import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuildService } from 'src/app/services/guild.service';
import { UsersService } from 'src/app/services/users.service';
import { FormControl } from '@angular/forms';
import { Args, Params, WSService } from 'src/app/services/ws.service';
import { LogService } from 'src/app/services/log.service';
import { ChannelService } from 'src/app/services/channel.service';
import { PermissionsService } from 'src/app/services/permissions.service';
import { Lean } from 'src/app/types/entity-types';
import { TextBasedChannel } from '../../text-based-channel';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-text-channel',
  templateUrl: './text-channel.component.html',
  styleUrls: ['./text-channel.component.css']
})
export class TextChannelComponent extends TextBasedChannel implements OnInit {
  @ViewChild('notificationSound') notificationSound: ElementRef;

  public get guild() {
    return this.guildService.getGuild(this.parentId);
  }

  constructor(
    channelService: ChannelService,
    guildService: GuildService,
    log: LogService,
    route: ActivatedRoute,
    userService: UsersService,
    perms: PermissionsService,
    sounds: SoundService,
    ws: WSService,
  ) {
    super(channelService, guildService, log, route, userService, perms, sounds, ws);
  }

  public async ngOnInit() {
    await super.init();
  }

  // emoji picker
  public addEmoji({ emoji }) {
    console.log(emoji.native);
    (document.querySelector('#chatBox') as HTMLInputElement).value += emoji.native;
  }

  public onClick({ path }) {
    const emojiPickerWasClicked = path
      .some(n => n && n.nodeName === 'EMOJI-MART' || n.classList?.contains('emoji-icon'));
    this.emojiPickerOpen = emojiPickerWasClicked;
  }

  // manage users
  // FIXME: move this somewhere else
  public kickMember(user: Lean.User) {
    console.log(user);
  }
}
