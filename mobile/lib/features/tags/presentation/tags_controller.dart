import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';
import '../data/repository/tags_repository.dart';
import '../domain/tag.dart';

part 'tags_controller.g.dart';

@riverpod
class TagsController extends _$TagsController {
  @override
  Stream<List<Tag>> build() {
    // Trigger initial sync
    Future.microtask(() => sync());
    return ref.watch(tagsRepositoryProvider).watchTags();
  }

  Future<void> sync() async {
    try {
      await ref.read(tagsRepositoryProvider).sync();
    } catch (e) {
      debugPrint('Tags sync error: $e');
    }
  }

  Future<Tag> createTag(String name, {String? color}) async {
    final tag = Tag(
      id: const Uuid().v4(),
      name: name,
      color: color ?? generateRandomTagColor(),
      updatedAt: DateTime.now(),
      isSynced: false,
    );
    // This now waits for server response when online
    return ref.read(tagsRepositoryProvider).createTag(tag);
  }

  Future<void> updateTag(Tag tag) async {
    await ref.read(tagsRepositoryProvider).updateTag(tag);
  }

  Future<void> deleteTag(String id) async {
    await ref.read(tagsRepositoryProvider).deleteTag(id);
  }
}

// Provider for tags on a specific note
@riverpod
Stream<List<Tag>> noteTagsStream(Ref ref, String noteId) {
  return ref.watch(tagsRepositoryProvider).watchTagsForNote(noteId);
}

// Provider for available tags (all tags that exist)
@riverpod
Future<List<Tag>> availableTags(Ref ref) async {
  return ref.watch(tagsRepositoryProvider).getTags();
}

// Selected tag for filtering
@riverpod
class SelectedTagFilter extends _$SelectedTagFilter {
  @override
  String? build() => null;

  void select(String? tagId) {
    state = tagId;
  }

  void clear() {
    state = null;
  }
}
