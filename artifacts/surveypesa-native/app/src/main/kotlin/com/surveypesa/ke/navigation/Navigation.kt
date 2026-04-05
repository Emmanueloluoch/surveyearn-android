package com.surveypesa.ke.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String) {
    object Auth : Screen("auth")
    object Home : Screen("home")
    object Survey : Screen("survey/{surveyId}") {
        fun withId(id: Int) = "survey/$id"
    }
    object Wallet : Screen("wallet")
    object Refer : Screen("refer")
    object Account : Screen("account")
}

data class BottomNavItem(val label: String, val icon: ImageVector, val route: String)

val bottomNavItems = listOf(
    BottomNavItem("Home", Icons.Filled.Home, Screen.Home.route),
    BottomNavItem("Wallet", Icons.Filled.AccountBalanceWallet, Screen.Wallet.route),
    BottomNavItem("Refer", Icons.Filled.People, Screen.Refer.route),
    BottomNavItem("Account", Icons.Filled.Person, Screen.Account.route),
)
