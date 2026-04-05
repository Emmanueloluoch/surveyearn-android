package com.surveypesa.ke.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.surveypesa.ke.api.ApiClient
import com.surveypesa.ke.models.*
import com.surveypesa.ke.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SurveyScreen(surveyId: Int, userId: Int, onBack: () -> Unit, onComplete: (Int) -> Unit) {
    var survey by remember { mutableStateOf<Survey?>(null) }
    var loading by remember { mutableStateOf(true) }
    var submitting by remember { mutableStateOf(false) }
    var currentIndex by remember { mutableStateOf(0) }
    var answers by remember { mutableStateOf<Map<Int, String>>(emptyMap()) }
    var done by remember { mutableStateOf(false) }
    var earnedPoints by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()
    val gson = Gson()

    LaunchedEffect(surveyId) {
        try {
            val res = ApiClient.service.getSurvey(surveyId)
            if (res.isSuccessful) survey = res.body()
        } catch (_: Exception) {}
        loading = false
    }

    if (loading) {
        Box(Modifier.fillMaxSize().background(GreenLight), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Green)
        }
        return
    }

    val s = survey ?: run {
        Box(Modifier.fillMaxSize().background(GreenLight), contentAlignment = Alignment.Center) {
            Text("Survey not found.", color = TextMuted)
        }
        return
    }

    val questions = s.questions ?: emptyList()

    if (done) {
        Box(Modifier.fillMaxSize().background(GreenLight), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                Text("🎉", fontSize = 56.sp)
                Spacer(Modifier.height(16.dp))
                Text("Survey Complete!", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextDark)
                Spacer(Modifier.height(8.dp))
                Text("+KSh $earnedPoints added to your balance", color = Green, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                Spacer(Modifier.height(24.dp))
                Button(
                    onClick = { onComplete(earnedPoints) },
                    colors = ButtonDefaults.buttonColors(containerColor = Green),
                    shape = RoundedCornerShape(10.dp)
                ) { Text("Back to Surveys", fontWeight = FontWeight.Bold) }
            }
        }
        return
    }

    val question = questions.getOrNull(currentIndex) ?: return
    val progress = if (questions.isNotEmpty()) (currentIndex + 1f) / questions.size else 0f

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(GreenLight)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(GreenDark)
                .padding(horizontal = 8.dp, vertical = 8.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, null, tint = White) }
                Column(Modifier.weight(1f)) {
                    Text(s.title, color = White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1)
                    Text("Question ${currentIndex + 1} of ${questions.size}", color = Color(0xFFa8dba8), fontSize = 12.sp)
                }
                Text("+KSh ${s.reward}", color = Gold, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }

        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier.fillMaxWidth(),
            color = Green,
            trackColor = GreenBorder
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = White)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text(question.text, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = TextDark)
                    Spacer(Modifier.height(16.dp))

                    when (question.type) {
                        "rating" -> {
                            val current = answers[question.id]?.toIntOrNull() ?: 0
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                (1..5).forEach { n ->
                                    FilterChip(
                                        selected = current == n,
                                        onClick = { answers = answers + (question.id to n.toString()) },
                                        label = { Text("$n") },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = Green,
                                            selectedLabelColor = White
                                        )
                                    )
                                }
                            }
                        }
                        "text" -> {
                            var text by remember(question.id) { mutableStateOf(answers[question.id] ?: "") }
                            OutlinedTextField(
                                value = text,
                                onValueChange = { text = it; answers = answers + (question.id to it) },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("Type your answer here...") },
                                minLines = 3
                            )
                        }
                        else -> {
                            val opts = question.options?.let {
                                gson.fromJson<List<String>>(it, object : TypeToken<List<String>>() {}.type)
                            } ?: emptyList()
                            val isMulti = question.type == "multiple_choice"
                            val selected = answers[question.id]?.split("|")?.toMutableSet() ?: mutableSetOf()

                            opts.forEach { opt ->
                                val checked = opt in selected
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    if (isMulti) {
                                        Checkbox(
                                            checked = checked,
                                            onCheckedChange = {
                                                val newSet = selected.toMutableSet()
                                                if (it) newSet.add(opt) else newSet.remove(opt)
                                                answers = answers + (question.id to newSet.joinToString("|"))
                                            },
                                            colors = CheckboxDefaults.colors(checkedColor = Green)
                                        )
                                    } else {
                                        RadioButton(
                                            selected = checked,
                                            onClick = { answers = answers + (question.id to opt) },
                                            colors = RadioButtonDefaults.colors(selectedColor = Green)
                                        )
                                    }
                                    Spacer(Modifier.width(4.dp))
                                    Text(opt, fontSize = 14.sp, color = TextDark)
                                }
                            }
                        }
                    }
                }
            }
        }

        Box(Modifier.fillMaxWidth().background(White).padding(16.dp)) {
            val hasAnswer = answers.containsKey(question.id) && answers[question.id]?.isNotEmpty() == true
            val isLast = currentIndex == questions.size - 1

            Button(
                onClick = {
                    if (isLast) {
                        scope.launch {
                            submitting = true
                            try {
                                val payload = ResponsePayload(
                                    userId = userId,
                                    answers = answers.map { (qId, ans) -> AnswerPayload(qId, ans) }
                                )
                                val res = ApiClient.service.submitResponse(s.id, payload)
                                if (res.isSuccessful) {
                                    earnedPoints = res.body()?.pointsEarned ?: s.reward
                                    done = true
                                }
                            } catch (_: Exception) {}
                            submitting = false
                        }
                    } else {
                        currentIndex++
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                enabled = (!question.required || hasAnswer) && !submitting,
                colors = ButtonDefaults.buttonColors(containerColor = Green),
                shape = RoundedCornerShape(10.dp)
            ) {
                if (submitting) CircularProgressIndicator(Modifier.size(20.dp), color = White, strokeWidth = 2.dp)
                else Text(if (isLast) "Submit Survey" else "Next", fontWeight = FontWeight.Bold)
            }
        }
    }
}
