import 'dart:math';
import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';

part 'tag.g.dart';

/// Curated list of pleasant tag colors (standard hex format for cross-platform)
const List<String> _tagColors = [
  '#E57373', // Red 300
  '#F06292', // Pink 300
  '#BA68C8', // Purple 300
  '#9575CD', // Deep Purple 300
  '#7986CB', // Indigo 300
  '#64B5F6', // Blue 300
  '#4FC3F7', // Light Blue 300
  '#4DD0E1', // Cyan 300
  '#4DB6AC', // Teal 300
  '#81C784', // Green 300
  '#AED581', // Light Green 300
  '#DCE775', // Lime 300
  '#FFD54F', // Amber 300
  '#FFB74D', // Orange 300
  '#FF8A65', // Deep Orange 300
  '#A1887F', // Brown 300
  '#90A4AE', // Blue Grey 300
];

/// Generates a random tag color as a standard hex string (#RRGGBB)
String generateRandomTagColor() {
  final random = Random();
  return _tagColors[random.nextInt(_tagColors.length)];
}

/// Parses a hex color string to Flutter Color
/// Supports: #RGB, #RRGGBB, #AARRGGBB, 0xAARRGGBB
Color parseTagColor(String? hexColor, {Color fallback = Colors.grey}) {
  if (hexColor == null || hexColor.isEmpty) return fallback;

  String hex = hexColor.replaceAll('#', '').replaceAll('0x', '');

  // Handle short format #RGB -> #RRGGBB
  if (hex.length == 3) {
    hex = hex.split('').map((c) => '$c$c').join();
  }

  // Add alpha if not present (6 chars -> 8 chars)
  if (hex.length == 6) {
    hex = 'FF$hex';
  }

  try {
    return Color(int.parse(hex, radix: 16));
  } catch (_) {
    return fallback;
  }
}

@JsonSerializable()
class Tag {
  final String id;
  final String name;
  final String? color;
  final DateTime? updatedAt;

  // Note count from server (optional, not stored locally)
  @JsonKey(name: '_count')
  final TagCount? count;

  // Local only
  @JsonKey(includeFromJson: false, includeToJson: false)
  final bool isSynced;

  @JsonKey(includeFromJson: false, includeToJson: false)
  final bool isDeleted;

  Tag({
    required this.id,
    required this.name,
    this.color,
    this.updatedAt,
    this.count,
    this.isSynced = true,
    this.isDeleted = false,
  });

  factory Tag.fromJson(Map<String, dynamic> json) => _$TagFromJson(json);
  Map<String, dynamic> toJson() => _$TagToJson(this);

  int get noteCount => count?.notes ?? 0;

  Tag copyWith({
    String? id,
    String? name,
    String? color,
    DateTime? updatedAt,
    TagCount? count,
    bool? isSynced,
    bool? isDeleted,
  }) {
    return Tag(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      updatedAt: updatedAt ?? this.updatedAt,
      count: count ?? this.count,
      isSynced: isSynced ?? this.isSynced,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }
}

@JsonSerializable()
class TagCount {
  final int notes;

  TagCount({required this.notes});

  factory TagCount.fromJson(Map<String, dynamic> json) =>
      _$TagCountFromJson(json);
  Map<String, dynamic> toJson() => _$TagCountToJson(this);
}
