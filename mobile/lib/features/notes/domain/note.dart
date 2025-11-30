import 'package:json_annotation/json_annotation.dart';

part 'note.g.dart';

enum NoteState {
  active,
  trashed,
  deleted;

  static NoteState fromString(String value) {
    return NoteState.values.firstWhere(
      (e) => e.name == value,
      orElse: () => NoteState.active,
    );
  }
}

@JsonSerializable()
class Note {
  final String id;
  final String title;
  final String? content;
  final bool isPinned;
  final bool isArchived;
  final String? color;
  final NoteState state;
  final DateTime? updatedAt;
  
  // Local only
  @JsonKey(includeFromJson: false, includeToJson: false)
  final bool isSynced;

  Note({
    required this.id,
    required this.title,
    this.content,
    this.isPinned = false,
    this.isArchived = false,
    this.color,
    this.state = NoteState.active,
    this.updatedAt,
    this.isSynced = true,
  });

  factory Note.fromJson(Map<String, dynamic> json) => _$NoteFromJson(json);
  Map<String, dynamic> toJson() => _$NoteToJson(this);

  bool get isActive => state == NoteState.active;
  bool get isTrashed => state == NoteState.trashed;
  bool get isDeleted => state == NoteState.deleted;

  Note copyWith({
    String? id,
    String? title,
    String? content,
    bool? isPinned,
    bool? isArchived,
    String? color,
    NoteState? state,
    DateTime? updatedAt,
    bool? isSynced,
  }) {
    return Note(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      isPinned: isPinned ?? this.isPinned,
      isArchived: isArchived ?? this.isArchived,
      color: color ?? this.color,
      state: state ?? this.state,
      updatedAt: updatedAt ?? this.updatedAt,
      isSynced: isSynced ?? this.isSynced,
    );
  }
}
