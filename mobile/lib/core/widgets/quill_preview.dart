import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:google_fonts/google_fonts.dart';

/// A lightweight read-only preview of Quill content for list views.
/// Uses a simple Text widget with plain text extracted from Delta JSON.
class QuillPreview extends StatelessWidget {
  /// The content in JSON Delta format or plain text.
  final String? content;

  /// Maximum lines to show.
  final int maxLines;

  /// Text style for the preview.
  final TextStyle? style;

  const QuillPreview({super.key, this.content, this.maxLines = 6, this.style});

  @override
  Widget build(BuildContext context) {
    if (content == null || content!.isEmpty) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final plainText = extractPlainTextFromQuillContent(content);

    if (plainText.isEmpty) {
      return const SizedBox.shrink();
    }

    return Text(
      plainText,
      style:
          style ??
          GoogleFonts.dmSans(
            fontSize: 14,
            height: 1.5,
            color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.8),
          ),
      maxLines: maxLines,
      overflow: TextOverflow.ellipsis,
    );
  }

  /// Extracts plain text from canonical Quill Delta JSON (`{ops: [...]}`).
  // Kept for backward source compatibility in case other widgets referenced it,
  // but the implementation now lives in the top-level helper below.
}

/// Extracts plain text from canonical Quill Delta JSON (`{ops: [...]}`).
/// Strict: returns empty string if the content is null/empty/invalid.
String extractPlainTextFromQuillContent(String? content) {
  if (content == null || content.isEmpty) return '';
  try {
    final json = jsonDecode(content);
    if (json is Map && json['ops'] is List) {
      final document = Document.fromJson(json['ops'] as List);
      final raw = document.toPlainText();
      final lines = raw
          .split(RegExp(r'\r?\n'))
          .map((l) => l.trim())
          .where((l) => l.isNotEmpty)
          .toList();
      // Preserve real newlines, but ignore multiple blank newlines.
      return lines.join('\n');
    }
  } catch (_) {
    // invalid JSON -> strict mode
  }
  return '';
}
