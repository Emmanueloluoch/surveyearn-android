package com.surveypesa.ke.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.surveypesa.ke.api.ApiClient
import com.surveypesa.ke.models.Survey
import com.surveypesa.ke.models.User
import com.surveypesa.ke.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(user: User, onSurveyClick: (Int) -> Unit, onAccountClick: () -> Unit) {
    var surveys by remember { mutableStateOf<List<Survey>>(emptyList()) }
    var completedIds by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var loading by remember { mutableStateOf(true) }
    var refreshing by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    val initials = user.name.split(" ").mapNotNull { it.firstOrNull()?.uppercaseChar() }
        .take(2).joinToString("")

    fun loadData() {
        scope.launch {
            try {
                val surveysRes = ApiClient.service.listSurveys()
                if (surveysRes.isSuccessful) surveys = surveysRes.body() ?: emptyList()
                val compRes = ApiClient.service.getCompletions(user.id)
                if (compRes.isSuccessful) completedIds = compRes.body()?.map { it.surveyId }?.toSet() ?: emptySet()
            } catch (_: Exception) {}
            loading = false
            refreshing = false
        }
    }

    LaunchedEffect(Unit) { loadData() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(GreenLight)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(GreenDark)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(Green, RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) { Text("KSh", color = White, fontSize = 8.sp, fontWeight = FontWeight.Bold) }
                    Text("SurveyEarn", color = White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(Green, RoundedCornerShape(18.dp))
                        .clickable { onAccountClick() },
                    contentAlignment = Alignment.Center
                ) { Text(initials, color = White, fontSize = 13.sp, fontWeight = FontWeight.Bold) }
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Green)
                ) {
                    Column(Modifier.padding(20.dp)) {
                        Text("Good day, ${user.name.split(" ").first()}!", color = White, fontSize = 14.sp)
                        Spacer(Modifier.height(4.dp))
                        Text("Available Balance", color = Color(0xFFa8dba8), fontSize = 12.sp)
                        Text("KSh ${user.points}", color = White, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
                        Spacer(Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            StatusChip(
                                label = if (user.isActivated) "Activated" else "Not Activated",
                                color = if (user.isActivated) Color(0xFF00b33c) else Color(0xFFf59e0b)
                            )
                            if (user.isVip) StatusChip(label = "VIP", color = Color(0xFF7c3aed))
                        }
                    }
                }
            }

            if (!user.isActivated) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB))
                    ) {
                        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Filled.Lock, null, tint = Gold, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text("Activate your account", fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextDark)
                                Text("Pay KSh 150 via M-Pesa to unlock 6 daily surveys", fontSize = 12.sp, color = TextMuted)
                            }
                        }
                    }
                }
            }

            item {
                Text("Available Surveys", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
            }

            if (loading) {
                item {
                    Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Green)
                    }
                }
            } else {
                val available = surveys.filter { it.isPublished }
                if (available.isEmpty()) {
                    item {
                        Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No surveys available right now.", color = TextMuted)
                        }
                    }
                } else {
                    items(available) { survey ->
                        val done = completedIds.contains(survey.id)
                        SurveyCard(survey = survey, done = done, onClick = { if (!done) onSurveyClick(survey.id) })
                    }
                }
            }

            item { Spacer(Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun StatusChip(label: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) { Text(label, color = color, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
}

@Composable
fun SurveyCard(survey: Survey, done: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable(enabled = !done) { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (done) GreenMuted else White)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(if (done) GreenBorder else GreenLight, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (done) Icons.Filled.CheckCircle else Icons.Filled.Assignment,
                    null,
                    tint = if (done) Green else Green,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(survey.title, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = if (done) TextMuted else TextDark)
                if (!survey.description.isNullOrEmpty()) {
                    Text(survey.description, fontSize = 12.sp, color = TextMuted, maxLines = 1)
                }
                Spacer(Modifier.height(4.dp))
                Text("+KSh ${survey.reward}", color = Green, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
            if (done) {
                Text("Done", color = Green, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            } else {
                Icon(Icons.Filled.ChevronRight, null, tint = GreenBorder)
            }
        }
    }
}
