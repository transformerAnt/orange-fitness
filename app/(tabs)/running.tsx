import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Design } from "@/constants/design";

type Playlist = {
  id: string;
  name: string;
  workouts: string[];
};

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "p1",
    name: "Push Day",
    workouts: ["Bench Press", "Incline DB Press", "Tricep Dips"],
  },
  {
    id: "p2",
    name: "Pull Day",
    workouts: ["Lat Pulldown", "Seated Row", "Bicep Curl"],
  },
  { id: "p3", name: "Leg Day", workouts: ["Back Squat", "RDL", "Calf Raises"] },
];

export default function RunningScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId) ?? null,
    [playlists, activePlaylistId],
  );

  const addPlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) return;
    const next: Playlist = {
      id: `${Date.now()}`,
      name,
      workouts: [],
    };
    setPlaylists((prev) => [next, ...prev]);
    setNewPlaylistName("");
    setShowAddPlaylist(false);
  };

  const addWorkout = () => {
    const name = newWorkoutName.trim();
    if (!name || !activePlaylistId) return;
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === activePlaylistId
          ? { ...p, workouts: [...p.workouts, name] }
          : p,
      ),
    );
    setNewWorkoutName("");
    setShowAddWorkout(false);
  };

  return (
    <SafeAreaProvider
      style={{ flex: 1, backgroundColor: Design.colors.background }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: Design.colors.background }}
      >
        <View
          style={{
            paddingHorizontal: Design.spacing.lg,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          <View style={{ gap: 16, marginTop: 50 }}>
            {playlists.map((playlist) => (
              <View
                key={playlist.id}
                style={{
                  borderColor: Design.colors.line,
                  borderRadius: 20,
                  borderWidth: 1,
                  padding: 16,
                  backgroundColor: Design.colors.surface,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 16,
                      fontFamily: Design.typography.fontSemiBold,
                    }}
                  >
                    {playlist.name}
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
                    {playlist.workouts.length} workouts
                  </Text>
                </View>

                {playlist.workouts.length ? (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {playlist.workouts.map((workout, index) => (
                      <Text
                        key={`${playlist.id}-${index}`}
                        style={{ color: Design.colors.muted, fontSize: 12 }}
                      >
                        � {workout}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={{
                      color: Design.colors.muted,
                      fontSize: 12,
                      marginTop: 10,
                    }}
                  >
                    No workouts yet. Add one below.
                  </Text>
                )}

                <Pressable
                  onPress={() => {
                    setActivePlaylistId(playlist.id);
                    setShowAddWorkout(true);
                  }}
                  style={{
                    marginTop: 12,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: Design.colors.violet,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: Design.colors.violet,
                      fontSize: 12,
                      fontFamily: Design.typography.fontSemiBold,
                    }}
                  >
                    Add Workout
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showAddPlaylist} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: Design.colors.surface,
              padding: 20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: Design.colors.line,
            }}
          >
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 16,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              New Playlist
            </Text>
            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="e.g. Upper Body Strength"
              placeholderTextColor={Design.colors.muted}
              style={{
                borderWidth: 1,
                borderColor: Design.colors.line,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginTop: 12,
                color: Design.colors.ink,
                backgroundColor: Design.colors.background,
              }}
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={() => setShowAddPlaylist(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Design.colors.line,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 13,
                    fontFamily: Design.typography.fontSemiBold,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={addPlaylist}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: Design.colors.ink,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Design.colors.white,
                    fontSize: 13,
                    fontFamily: Design.typography.fontSemiBold,
                  }}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showAddWorkout} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: Design.colors.surface,
              padding: 20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: Design.colors.line,
            }}
          >
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 16,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              Add Workout {activePlaylist ? `to ${activePlaylist.name}` : ""}
            </Text>
            <TextInput
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
              placeholder="e.g. Lat Pulldown"
              placeholderTextColor={Design.colors.muted}
              style={{
                borderWidth: 1,
                borderColor: Design.colors.line,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginTop: 12,
                color: Design.colors.ink,
                backgroundColor: Design.colors.background,
              }}
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={() => setShowAddWorkout(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Design.colors.line,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 13,
                    fontFamily: Design.typography.fontSemiBold,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={addWorkout}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: Design.colors.ink,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Design.colors.white,
                    fontSize: 13,
                    fontFamily: Design.typography.fontSemiBold,
                  }}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}
