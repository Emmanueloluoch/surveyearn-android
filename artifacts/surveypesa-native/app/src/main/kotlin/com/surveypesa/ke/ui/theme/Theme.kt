package com.surveypesa.ke.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Green = Color(0xFF00b33c)
val GreenDark = Color(0xFF004d00)
val GreenLight = Color(0xFFe5f7e0)
val GreenCard = Color(0xFFf0fced)
val GreenBorder = Color(0xFFa8dba8)
val GreenMuted = Color(0xFFd4f0d4)
val Gold = Color(0xFFf59e0b)
val Purple = Color(0xFF7c3aed)
val White = Color.White
val TextDark = Color(0xFF004d00)
val TextMuted = Color(0xFF3d7a3d)

private val LightColors = lightColorScheme(
    primary = Green,
    onPrimary = White,
    primaryContainer = GreenLight,
    onPrimaryContainer = GreenDark,
    secondary = Color(0xFFc8f5c8),
    onSecondary = GreenDark,
    background = GreenLight,
    onBackground = GreenDark,
    surface = GreenCard,
    onSurface = GreenDark,
    outline = GreenBorder,
    error = Color(0xFFef4444),
    onError = White
)

@Composable
fun SurveyEarnTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        content = content
    )
}
