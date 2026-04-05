package com.surveypesa.ke.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.surveypesa.ke.api.ApiClient
import com.surveypesa.ke.models.User
import com.surveypesa.ke.models.Withdrawal
import com.surveypesa.ke.models.WithdrawalRequest
import com.surveypesa.ke.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun WalletScreen(user: User) {
    var withdrawals by remember { mutableStateOf<List<Withdrawal>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var amount by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf(user.phone ?: "") }
    var submitting by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val minWithdrawal = 3000

    LaunchedEffect(Unit) {
        try {
            val res = ApiClient.service.getWithdrawals(user.id)
            if (res.isSuccessful) withdrawals = res.body() ?: emptyList()
        } catch (_: Exception) {}
        loading = false
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(GreenLight),
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
                    Text("Your Balance", color = Color(0xFFa8dba8), fontSize = 12.sp)
                    Text("KSh ${user.points}", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.ExtraBold)
                    Text("Min withdrawal: KSh $minWithdrawal", color = Color(0xFFa8dba8), fontSize = 12.sp)
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Withdraw via M-Pesa", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                    Spacer(Modifier.height(12.dp))
                    OutlinedTextField(
                        value = amount, onValueChange = { amount = it },
                        label = { Text("Amount (KSh)") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = phone, onValueChange = { phone = it },
                        label = { Text("M-Pesa Phone Number") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true
                    )
                    if (message.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Text(message, color = if (isError) MaterialTheme.colorScheme.error else Green, fontSize = 13.sp)
                    }
                    Spacer(Modifier.height(12.dp))
                    Button(
                        onClick = {
                            val amt = amount.toIntOrNull() ?: 0
                            when {
                                amt < minWithdrawal -> { message = "Minimum withdrawal is KSh $minWithdrawal"; isError = true }
                                amt > user.points -> { message = "Insufficient balance."; isError = true }
                                phone.isBlank() -> { message = "Enter your M-Pesa phone number."; isError = true }
                                else -> scope.launch {
                                    submitting = true
                                    try {
                                        val res = ApiClient.service.createWithdrawal(
                                            WithdrawalRequest(user.id, amt, phone.trim())
                                        )
                                        if (res.isSuccessful) {
                                            message = "Withdrawal request submitted! You'll receive KSh $amt via M-Pesa shortly."
                                            isError = false
                                            amount = ""
                                        } else {
                                            message = "Request failed. Try again."
                                            isError = true
                                        }
                                    } catch (_: Exception) { message = "Network error."; isError = true }
                                    submitting = false
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        enabled = !submitting,
                        colors = ButtonDefaults.buttonColors(containerColor = Green),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        if (submitting) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                        else Text("Request Withdrawal", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        item { Text("Withdrawal History", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark) }

        if (loading) {
            item { Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Green) } }
        } else if (withdrawals.isEmpty()) {
            item { Text("No withdrawals yet.", color = TextMuted, modifier = Modifier.padding(8.dp)) }
        } else {
            items(withdrawals.sortedByDescending { it.createdAt }) { w ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("KSh ${w.amount}", fontWeight = FontWeight.Bold, color = TextDark)
                            Text(w.phone, fontSize = 12.sp, color = TextMuted)
                        }
                        val statusColor = when (w.status) {
                            "completed" -> Green; "rejected" -> Color(0xFFef4444); else -> Gold
                        }
                        Text(w.status.replaceFirstChar { it.uppercase() }, color = statusColor, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                    }
                }
            }
        }

        item { Spacer(Modifier.height(80.dp)) }
    }
}
