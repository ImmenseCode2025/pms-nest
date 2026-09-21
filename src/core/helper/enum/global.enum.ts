export enum FileExtensionsEnum {
  All = 'jpg|jpeg|png|gif|svg|mp4|avi|mov|webm|pdf|doc|docx|xls|xlsx|mp3|wav|ogg|m4a|flac|aac|wma|webm|WEBM|MP4|AVI|MOV|JPG|JPEG|PNG|GIF|SVG|PDF|DOC|DOCX|XLS|XLSX|MP3|WAV|OGG|M4A|FLAC|AAC|WMA',
  Image = 'jpg|jpeg|png|gif|svg|SAG|GPG|PNG|JPEG|GIF',
  Audio = 'MP3|mp3',
  Video = 'mp4|avi|mov|webm|MP4|AVI|MOV|WEBM',
}

export enum ApiResponseEnum {
  Success = 'success',
}

export enum PlatformEnum {
  App = 'app',
  Apple = 'apple',
  Google = 'google',
  Facebook = 'facebook',
}

export enum QueueNamesEnum {
  TaskQueue = 'EyeInward',
  SeenWritten = 'seen_written',
  SeenGuided = 'seen_guided',
  SeenMeditation = 'seen_mediation',
  SeenSoundHealing = 'seen_sound_healing',
  FollowUser = 'follow_user',
  PostLike = 'post_like',
}
export enum EnvironmentModeEnum {
  Production = 'production',
  Development = 'development',
}

export enum ErrorLogsUrlEnum {
  SendingOtp = 'sending_otp',
}

export enum FriendStatusEnum {
  Requested = 'requested',
  Friend = 'friend',
}

export enum GalleryAbleType {
  POST = 'post',
}
export enum NotificationTitleEnum {
  FriendRequest = 'Friend request',
  AcceptRequest = 'Accept request',
  NewCruise = 'New cruise',
  FollowUser = 'Started following you',
  PostLike = 'Liked your post',
}
export enum RoomPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}
export enum CommentableType {
  POST = 'post',
  COMMENT = 'comment',
}
export enum LikeableType {
  POST = 'post',
  COMMENT = 'comment',
}

export enum ContestsStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum StyleAlignmentEnum {
  ON_TARGET = 'on_target',
  ALMOST_THERE = 'almost_there',
  NEEDS_WORK = 'needs_work',
}

export enum FeedbackStrengthEnum {
  FIT = 'fit',
  COLOR = 'color',
  SILHOUETTE = 'silhouette',
  LAYERING = 'layering',
}

export enum FeedbackImprovementEnum {
  ADD_CONTRAST = 'add_contrast',
  BETTER_FIT = 'better_fit',
  DIFFERENT_SHOES = 'different_shoes',
  ACCESSORIES = 'accessories',
}

export enum RedisKeysEnum {
  VerifyMobileNumber = 'verify-mobile-number:',
}
export enum NotificationTypeEnum {
  AddFriend = 'add_friend',
  AcceptRequest = 'accept_request',
  NewCruise = 'new_cruise',
  FollowUser = 'follow_user',
  PostLike = 'post_like',
}

export enum NotificationRelatedTypeEnum {
  Friend = 'friend',
  Cruise = 'cruise',
  User = 'user',
}

export enum FilterTypeEnum {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  ONE_OF = 'one_of',
}

export enum NumberFilterTypeEnum {
  EQUAL_TO = 'equal_to',
  LESS_THAN = 'less_than',
  GREATER_THAN = 'greater_than',
  LESS_THAN_EQUAL_TO = 'less_than_equal_to',
  GREATER_THAN_EQUAL_TO = 'greater_than_equal_to',
}

export enum DateFilterTypeEnum {
  EQUAL_TO = 'equal_to',
  LESS_THAN = 'less_than',
  GREATER_THAN = 'greater_than',
  LESS_THAN_EQUAL_TO = 'less_than_equal_to',
  GREATER_THAN_EQUAL_TO = 'greater_than_equal_to',
}

export enum CountEnum {
  Increment = 'increment',
  Decrement = 'decrement',
}

export enum RoomRolesEnum {
  ADMIN = 'admin',
  USER = 'user',
}

export enum CurrentStyleEnum {
  CASUAL = 'casual',
  CASUAL_AND_RELAXED = 'casual_and_relaxed',
  BUSINESS_PROFESSIONAL = 'business_professional',
  STREETWEAR = 'streetwear',
  MINIMALIST = 'minimalist',
  VINTAGE = 'vintage',
  ATHLEISURE = 'athleisure',
}

export enum AspiringStyleEnum {
  ELEVATED_CASUAL = 'elevated_casual',
  CLASSIC_AND_TIMELESS = 'classic_and_timeless',
  ELEGANT_AND_REFINED = 'elegant_and_refined',
  MODERN_AND_CLEAN = 'modern_and_clean',
  BOLD_AND_EXPERIMENTAL = 'bold_and_experimental',
  ECLECTIC_AND_CREATIVE = 'eclectic_and_creative',
  BOHO_AND_FREE_SPIRITED = 'boho_and_free_spirited',
}

export enum ColorPaletteEnum {
  NEUTRAL_EARTH_TONES = 'neutral_earth_tones',
  NEUTRALS_AND_EARTH_TONES = 'neutrals_and_earth_tones',
  MONOCHROME = 'monochrome',
  PASTELS = 'pastels',
  BOLD_AND_BRIGHT = 'bold_and_bright',
  DARK_AND_MOODY = 'dark_and_moody',
  WARM_TONES = 'warm_tones',
}

export enum GlobalSearchTypeEnum {
  USERS = 'users',
  POSTS = 'posts',
  ROOMS = 'rooms',
}
