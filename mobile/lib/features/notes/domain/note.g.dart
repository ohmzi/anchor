// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'note.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Note _$NoteFromJson(Map<String, dynamic> json) => Note(
  id: json['id'] as String,
  title: json['title'] as String,
  content: json['content'] as String?,
  isPinned: json['isPinned'] as bool? ?? false,
  isArchived: json['isArchived'] as bool? ?? false,
  color: json['color'] as String?,
  state:
      $enumDecodeNullable(_$NoteStateEnumMap, json['state']) ??
      NoteState.active,
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$NoteToJson(Note instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'content': instance.content,
  'isPinned': instance.isPinned,
  'isArchived': instance.isArchived,
  'color': instance.color,
  'state': _$NoteStateEnumMap[instance.state]!,
  'updatedAt': instance.updatedAt?.toIso8601String(),
};

const _$NoteStateEnumMap = {
  NoteState.active: 'active',
  NoteState.trashed: 'trashed',
  NoteState.deleted: 'deleted',
};
