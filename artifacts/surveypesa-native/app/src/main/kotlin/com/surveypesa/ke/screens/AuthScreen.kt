package com.surveypesa.ke.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.surveypesa.ke.api.ApiClient
import com.surveypesa.ke.models.*
import com.surveypesa.ke.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(onAuthSuccess: (User) -> Unit) {
    var isLogin by remember { mutableStateOf(true) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var referralCode by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    fun submit() {
        error = ""
        if (email.isBlank() || password.isBlank()) { error = "Email and password are required."; return }
        if (!isLogin && name.isBlank()) { error = "Name is required."; return }
        if (!isLogin && phone.isBlank()) { error = "Phone number is required."; return }
        if (password.length < 6) { error = "Password must be at least 6 characters."; return }

        scope.launch {
            loading = true
            try {
                val res = if (isLogin) {
                    ApiClient.service.login(LoginRequest(email.trim(), password))
                } else {
                    ApiClient.service.signup(
                        SignupRequest(name.trim(), email.trim(), password, phone.trim(),
                            referralCode.trim().takeIf { it.isNotEmpty() })
                    )
                }
                if (res.isSuccessful) {
                    res.body()?.user?.let { onAuthSuccess(it) }
                } else {
                    error = if (isLogin) "Invalid email or password." else "Sign up failed. Try a different email."
                }
            } catch (e: Exception) {
                error = "Network error. Check your connection."
            }
            loading = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(GreenDark),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(48.dp))

            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(Green, RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("KSh", color = White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
            }

            Spacer(Modifier.height(12.dp))
            Text("SurveyEarn", color = White, fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("Earn KSh by completing surveys", color = Color(0xFFa8dba8), fontSize = 14.sp)
            Spacer(Modifier.height(32.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = White)
            ) {
                Column(Modifier.padding(20.dp)) {
                    Row(Modifier.fillMaxWidth()) {
                        listOf("Login" to true, "Sign Up" to false).forEach { (label, isLoginTab) ->
                            Button(
                                onClick = { isLogin = isLoginTab; error = "" },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isLogin == isLoginTab) Green else Color(0xFFe5f7e0),
                                    contentColor = if (isLogin == isLoginTab) White else GreenDark
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text(label, fontWeight = FontWeight.SemiBold) }
                            if (label == "Login") Spacer(Modifier.width(8.dp))
                        }
                    }
                    Spacer(Modifier.height(16.dp))

                    if (!isLogin) {
                        OutlinedTextField(
                            value = name, onValueChange = { name = it },
                            label = { Text("Full Name") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(Modifier.height(8.dp))
                    }

                    OutlinedTextField(
                        value = email, onValueChange = { email = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )
                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = password, onValueChange = { password = it },
                        label = { Text("Password") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showPassword = !showPassword }) {
                                Icon(if (showPassword) Icons.Filled.Visibility else Icons.Filled.VisibilityOff, null)
                            }
                        }
                    )

                    if (!isLogin) {
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = phone, onValueChange = { phone = it },
                            label = { Text("Phone (e.g. 0712345678)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                        )
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = referralCode, onValueChange = { referralCode = it },
                            label = { Text("Referral Code (optional)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }

                    if (error.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Text(error, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    }

                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = { submit() },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        enabled = !loading,
                        colors = ButtonDefaults.buttonColors(containerColor = Green),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        if (loading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = White, strokeWidth = 2.dp)
                        else Text(if (isLogin) "Login" else "Create Account", fontWeight = FontWeight.Bold)
                    }
                }
            }
            Spacer(Modifier.height(32.dp))
        }
    }
}
