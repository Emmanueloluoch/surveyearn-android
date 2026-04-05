package com.surveypesa.ke.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.surveypesa.ke.models.User
import com.surveypesa.ke.ui.theme.*

@Composable
fun ReferScreen(user: User) {
    val context = LocalContext.current
    var copied by remember { mutableStateOf(false) }
    val code = user.referralCode ?: "—"
    val shareText = "Join SurveyPesa KE and earn money by completing surveys! Use my referral code $code when you sign up. Download now and start earning KSh today!"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(GreenLight)
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(24.dp))

        Box(
            modifier = Modifier
                .size(80.dp)
                .background(Green, RoundedCornerShape(40.dp)),
            contentAlignment = Alignment.Center
        ) { Text("👥", fontSize = 36.sp) }

        Spacer(Modifier.height(16.dp))
        Text("Refer & Earn", fontWeight = FontWeight.ExtraBold, fontSize = 24.sp, color = TextDark)
        Spacer(Modifier.height(8.dp))
        Text(
            "Share your referral code with friends. You earn KSh 200 for every friend who signs up and activates their account.",
            color = TextMuted, fontSize = 14.sp, textAlign = TextAlign.Center
        )

        Spacer(Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Your Referral Code", color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.height(8.dp))
                Text(code, fontWeight = FontWeight.ExtraBold, fontSize = 32.sp, color = Green)
                Spacer(Modifier.height(16.dp))

                Button(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("referral_code", code))
                        copied = true
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = if (copied) GreenDark else Green),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Filled.ContentCopy, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(if (copied) "Copied!" else "Copy Code", fontWeight = FontWeight.SemiBold)
                }

                Spacer(Modifier.height(8.dp))

                OutlinedButton(
                    onClick = {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, shareText)
                        }
                        context.startActivity(Intent.createChooser(intent, "Share SurveyPesa KE"))
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Green)
                ) {
                    Icon(Icons.Filled.Share, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Share with Friends", fontWeight = FontWeight.SemiBold)
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            EarnCard(modifier = Modifier.weight(1f), emoji = "✅", amount = "KSh 200", label = "Per referral who activates")
            EarnCard(modifier = Modifier.weight(1f), emoji = "💰", amount = "No limit", label = "Refer as many as you like")
        }
    }
}

@Composable
fun EarnCard(modifier: Modifier, emoji: String, amount: String, label: String) {
    Card(modifier = modifier, shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
        Column(Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(emoji, fontSize = 24.sp)
            Spacer(Modifier.height(4.dp))
            Text(amount, fontWeight = FontWeight.Bold, color = Green, fontSize = 15.sp)
            Text(label, fontSize = 11.sp, color = TextMuted, textAlign = TextAlign.Center)
        }
    }
}
