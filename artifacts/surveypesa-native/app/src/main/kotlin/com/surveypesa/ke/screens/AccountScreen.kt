package com.surveypesa.ke.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.surveypesa.ke.models.User
import com.surveypesa.ke.ui.theme.*

@Composable
fun AccountScreen(user: User, onLogout: () -> Unit) {
    val initials = user.name.split(" ").mapNotNull { it.firstOrNull()?.uppercaseChar() }.take(2).joinToString("")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(GreenLight)
            .verticalScroll(rememberScrollState())
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(GreenDark)
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .background(Green, RoundedCornerShape(36.dp)),
                    contentAlignment = Alignment.Center
                ) { Text(initials, color = White, fontSize = 26.sp, fontWeight = FontWeight.Bold) }
                Spacer(Modifier.height(10.dp))
                Text(user.name, color = White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(user.email, color = Color(0xFFa8dba8), fontSize = 13.sp)
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusChip(label = if (user.isActivated) "Activated" else "Not Activated",
                        color = if (user.isActivated) Green else Gold)
                    if (user.isVip) StatusChip(label = "VIP Member", color = Purple)
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                InfoRow(icon = Icons.Filled.Phone, label = "Phone", value = user.phone ?: "Not set")
                Divider(color = GreenBorder, thickness = 0.5.dp)
                InfoRow(icon = Icons.Filled.Star, label = "Referral Code", value = user.referralCode ?: "—")
                Divider(color = GreenBorder, thickness = 0.5.dp)
                InfoRow(icon = Icons.Filled.AccountBalanceWallet, label = "Points Balance", value = "KSh ${user.points}")
            }

            if (!user.isActivated) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB))
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Activate Your Account", fontWeight = FontWeight.Bold, color = TextDark)
                        Spacer(Modifier.height(4.dp))
                        Text("Pay KSh 150 via M-Pesa to activate and unlock 6 daily surveys.", fontSize = 13.sp, color = TextMuted)
                        Spacer(Modifier.height(8.dp))
                        Text("Till Number: 5403204", fontWeight = FontWeight.SemiBold, color = Gold, fontSize = 14.sp)
                        Text("Name: EMMANUEL OLUOCH ODHIAMBO", fontSize = 12.sp, color = TextMuted)
                    }
                }
            }

            if (!user.isVip) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F3FF))
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("👑", fontSize = 20.sp)
                            Spacer(Modifier.width(8.dp))
                            Text("Upgrade to VIP", fontWeight = FontWeight.Bold, color = Purple)
                        }
                        Spacer(Modifier.height(4.dp))
                        Text("Pay KSh 500 via M-Pesa for unlimited daily surveys.", fontSize = 13.sp, color = Color(0xFF6b5c9e))
                        Spacer(Modifier.height(8.dp))
                        Text("Till Number: 5403204", fontWeight = FontWeight.SemiBold, color = Purple, fontSize = 14.sp)
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            Button(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFef4444)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Filled.Logout, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Logout", fontWeight = FontWeight.Bold)
            }

            Spacer(Modifier.height(8.dp))
            Text("SurveyPesa KE v1.0", color = TextMuted, fontSize = 12.sp,
                modifier = Modifier.align(Alignment.CenterHorizontally))
            Spacer(Modifier.height(80.dp))
        }
    }
}

@Composable
fun SectionCard(content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) { Column(Modifier.padding(4.dp), content = content) }
}

@Composable
fun InfoRow(icon: ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = Green, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(label, fontSize = 12.sp, color = TextMuted)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
        }
    }
}
