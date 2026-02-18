import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Design } from "@/constants/design";
export default (props:any) => {
	return (
		<SafeAreaProvider 
			style={{
				flex: 1,
				backgroundColor: Design.colors.background,
			}}>
			<ScrollView  
				style={{
					flex: 1,
					backgroundColor: Design.colors.background,
					borderRadius: 40,
				}}>
				<View 
					style={{
						backgroundColor: Design.colors.background,
						paddingTop: 12,
					}}>
					<View 
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 35,
							marginLeft: 26,
							marginRight: 14,
						}}>
						<Text 
							style={{
								color: Design.colors.ink,
								fontSize: 15,
								fontFamily: Design.typography.fontSemiBold,
							}}>
							{"9:41"}
						</Text>
						<Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/qf48wcn1_expires_30_days.png"}} 
							resizeMode = {"stretch"}
							style={{
								width: 66,
								height: 11,
							}}
						/>
					</View>
					<View 
						style={{
							alignSelf: "flex-start",
							marginBottom: 36,
							marginLeft: 16,
						}}>
						<Text 
							style={{
								color: Design.colors.muted,
								fontSize: 12,
								fontFamily: Design.typography.fontMedium,
								marginBottom: 10,
								marginRight: 64,
							}}>
							{"EVERYDAY WE'RE MUSCLE'N"}
						</Text>
						<View 
							style={{
								alignSelf: "flex-start",
								flexDirection: "row",
								alignItems: "center",
							}}>
							<Text 
							style={{
								color: Design.colors.ink,
								fontSize: 26,
								fontFamily: Design.typography.fontBold,
								marginRight: 12,
							}}>
								{"Hello, Kakashi"}
							</Text>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/86ngt23u_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 24,
									height: 24,
								}}
							/>
						</View>
					</View>
					<View 
						style={{
							marginBottom: 36,
							marginHorizontal: 15,
						}}>
						<View 
							style={{
								marginBottom: 42,
							}}>
							<Text 
							style={{
								color: Design.colors.ink,
								fontSize: 20,
								fontFamily: Design.typography.fontSemiBold,
								marginBottom: 16,
							}}>
								{"My Plan"}
							</Text>
							<View 
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginBottom: 16,
								}}>
								<TouchableOpacity 
									onPress={() => router.push("/workouts")}
									style={{
										flex: 1,
										backgroundColor: Design.colors.accentSoft,
										borderRadius: 16,
										paddingVertical: 12,
										paddingLeft: 12,
										marginRight: 16,
									}}>
									<Image
										source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/0qvrwlux_expires_30_days.png"}} 
										resizeMode = {"stretch"}
										style={{
											width: 40,
											height: 40,
											marginBottom: 13,
										}}
									/>
									<View 
										style={{
											alignSelf: "flex-start",
										}}>
										<Text 
											style={{
												color: Design.colors.ink,
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 2,
											}}>
											{"Workout"}
										</Text>
										<Text 
											style={{
												color: Design.colors.muted,
												fontSize: 14,
												fontFamily: Design.typography.fontMedium,
												marginRight: 28,
											}}>
											{"2 hours"}
										</Text>
									</View>
								</TouchableOpacity>
								<View 
									style={{
										borderColor: Design.colors.line,
										borderRadius: 16,
										borderWidth: 1,
										paddingVertical: 12,
										paddingLeft: 12,
										paddingRight: 30,
										backgroundColor: Design.colors.surface,
									}}>
									<Image
										source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/fo6dqfz4_expires_30_days.png"}} 
										resizeMode = {"stretch"}
										style={{
											width: 40,
											height: 40,
											marginBottom: 13,
										}}
									/>
									<View 
										style={{
											alignSelf: "flex-start",
										}}>
										<Text 
											style={{
												color: Design.colors.ink,
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 2,
											}}>
											{"Meditate"}
										</Text>
										<Text 
											style={{
												color: Design.colors.muted,
												fontSize: 14,
												fontFamily: Design.typography.fontMedium,
												marginRight: 30,
											}}>
											{"2 hours"}
										</Text>
									</View>
								</View>
							</View>
							<View 
								style={{
									flexDirection: "row",
									alignItems: "center",
								}}>
								<View 
									style={{
										flex: 1,
										flexDirection: "row",
										justifyContent: "space-between",
										alignItems: "center",
										borderColor: Design.colors.line,
										borderRadius: 16,
										borderWidth: 1,
										paddingVertical: 16,
										paddingHorizontal: 12,
										marginRight: 16,
										backgroundColor: Design.colors.surface,
									}}>
									<View >
										<Text 
											style={{
												color: Design.colors.ink,
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 2,
											}}>
											{"Food"}
										</Text>
										<Text 
											style={{
												color: Design.colors.muted,
												fontSize: 14,
												fontFamily: Design.typography.fontMedium,
											}}>
											{"2 hours"}
										</Text>
									</View>
									<Image
										source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/qfyv6j71_expires_30_days.png"}} 
										resizeMode = {"stretch"}
										style={{
											width: 40,
											height: 40,
										}}
									/>
								</View>
								<TouchableOpacity 
									style={{
										flex: 1,
										alignItems: "center",
										backgroundColor: Design.colors.ink,
										borderRadius: 16,
										paddingVertical: 21,
									}} onPress={() => router.push("/workouts")}>
									<View >
										<Text 
											style={{
												color: "#FFFFFF",
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 4,
											}}>
											{"Let's Go"}
										</Text>
										<View 
											style={{
												width: 61,
												height: 4,
												backgroundColor: Design.colors.accent,
												borderRadius: 10,
											}}>
										</View>
									</View>
								</TouchableOpacity>
							</View>
						</View>
						<View >
							<Text 
								style={{
									color: Design.colors.ink,
									fontSize: 20,
									fontFamily: Design.typography.fontSemiBold,
									marginBottom: 16,
								}}>
								{"Weekly Stats"}
							</Text>
							<View 
								style={{
									alignItems: "center",
									borderColor: Design.colors.line,
									borderRadius: 20,
									borderWidth: 1,
									paddingVertical: 15,
									backgroundColor: Design.colors.surface,
								}}>
								<View 
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginBottom: 25,
									}}>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 14,
											fontFamily: Design.typography.fontSemiBold,
											marginRight: 9,
										}}>
										{"Most Active:"}
									</Text>
									<Text 
										style={{
											color: Design.colors.muted,
											fontSize: 14,
											fontFamily: Design.typography.fontSemiBold,
										}}>
										{"Friday"}
									</Text>
								</View>
								<View 
									style={{
										alignSelf: "stretch",
										flexDirection: "row",
										marginHorizontal: 18,
									}}>
									<View 
										style={{
											height: 56,
											flex: 1,
											backgroundColor: Design.colors.accentSoft,
											borderColor: Design.colors.muted,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginTop: 60,
											marginRight: 22,
										}}>
									</View>
									<View 
										style={{
											height: 67,
											flex: 1,
											backgroundColor: Design.colors.accentSoft,
											borderColor: Design.colors.muted,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginTop: 49,
											marginRight: 23,
										}}>
									</View>
									<View 
										style={{
											height: 43,
											flex: 1,
											backgroundColor: Design.colors.accentSoft,
											borderColor: Design.colors.muted,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginTop: 73,
											marginRight: 23,
										}}>
									</View>
									<View 
										style={{
											height: 82,
											flex: 1,
											backgroundColor: Design.colors.accentSoft,
											borderColor: Design.colors.muted,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginTop: 34,
											marginRight: 22,
										}}>
									</View>
									<View 
										style={{
											height: 116,
											flex: 1,
											backgroundColor: Design.colors.accent,
											borderColor: Design.colors.ink,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginRight: 23,
										}}>
									</View>
									<View 
										style={{
											height: 75,
											flex: 1,
											backgroundColor: Design.colors.accentSoft,
											borderColor: Design.colors.muted,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginTop: 41,
											marginRight: 23,
										}}>
									</View>
									<View 
										style={{
											height: 56,
											flex: 1,
											backgroundColor: Design.colors.accentSoft,
											borderColor: Design.colors.muted,
											borderTopLeftRadius: 8,
											borderTopRightRadius: 8,
											borderWidth: 1,
											marginTop: 60,
										}}>
									</View>
								</View>
								<View 
									style={{
										height: 1,
										alignSelf: "stretch",
										backgroundColor: Design.colors.ink,
										marginBottom: 5,
									}}>
								</View>
								<View 
									style={{
										alignSelf: "stretch",
										flexDirection: "row",
										alignItems: "center",
										marginHorizontal: 16,
									}}>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											textAlign: "center",
											marginRight: 27,
											flex: 1,
										}}>
										{"Mon"}
									</Text>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											textAlign: "center",
											marginRight: 27,
											flex: 1,
										}}>
										{"Tue"}
									</Text>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											textAlign: "center",
											marginRight: 27,
											flex: 1,
										}}>
										{"Wed"}
									</Text>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											textAlign: "center",
											marginRight: 31,
											flex: 1,
										}}>
										{"Thu"}
									</Text>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											marginRight: 35,
										}}>
										{"Fri"}
									</Text>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											textAlign: "center",
											marginRight: 30,
											flex: 1,
										}}>
										{"Sat"}
									</Text>
									<Text 
										style={{
											color: Design.colors.ink,
											fontSize: 12,
											textAlign: "center",
											flex: 1,
										}}>
										{"Sun"}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaProvider>
	)
}








