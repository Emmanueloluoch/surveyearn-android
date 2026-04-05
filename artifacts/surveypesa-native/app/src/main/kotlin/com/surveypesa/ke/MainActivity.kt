package com.surveypesa.ke

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.surveypesa.ke.datastore.SessionStore
import com.surveypesa.ke.models.User
import com.surveypesa.ke.navigation.*
import com.surveypesa.ke.screens.*
import com.surveypesa.ke.ui.theme.SurveyEarnTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SurveyEarnTheme {
                SurveyEarnApp()
            }
        }
    }
}

@Composable
fun SurveyEarnApp() {
    val context = LocalContext.current
    val sessionStore = remember { SessionStore(context) }
    val scope = rememberCoroutineScope()
    val storedUser by sessionStore.userFlow.collectAsState(initial = null)
    var currentUser by remember { mutableStateOf<User?>(null) }
    var sessionLoaded by remember { mutableStateOf(false) }

    LaunchedEffect(storedUser) {
        if (!sessionLoaded) {
            currentUser = storedUser
            sessionLoaded = true
        }
    }

    if (!sessionLoaded) {
        Surface(modifier = Modifier.fillMaxSize()) {}
        return
    }

    if (currentUser == null) {
        AuthScreen(onAuthSuccess = { user ->
            scope.launch { sessionStore.saveUser(user) }
            currentUser = user
        })
    } else {
        MainApp(
            user = currentUser!!,
            onUserUpdate = { updated ->
                scope.launch { sessionStore.saveUser(updated) }
                currentUser = updated
            },
            onLogout = {
                scope.launch { sessionStore.clearUser() }
                currentUser = null
            }
        )
    }
}

@Composable
fun MainApp(user: User, onUserUpdate: (User) -> Unit, onLogout: () -> Unit) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val isSurveyScreen = currentRoute?.startsWith("survey/") == true

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (!isSurveyScreen) {
                NavigationBar(containerColor = androidx.compose.ui.graphics.Color.White) {
                    bottomNavItems.forEach { item ->
                        NavigationBarItem(
                            selected = currentRoute == item.route,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = com.surveypesa.ke.ui.theme.Green,
                                selectedTextColor = com.surveypesa.ke.ui.theme.Green,
                                indicatorColor = com.surveypesa.ke.ui.theme.GreenLight
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    user = user,
                    onSurveyClick = { surveyId ->
                        navController.navigate(Screen.Survey.withId(surveyId))
                    },
                    onAccountClick = {
                        navController.navigate(Screen.Account.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
            composable(Screen.Wallet.route) {
                WalletScreen(user = user)
            }
            composable(Screen.Refer.route) {
                ReferScreen(user = user)
            }
            composable(Screen.Account.route) {
                AccountScreen(user = user, onLogout = onLogout)
            }
            composable(Screen.Survey.route) { backStack ->
                val surveyId = backStack.arguments?.getString("surveyId")?.toIntOrNull() ?: return@composable
                SurveyScreen(
                    surveyId = surveyId,
                    userId = user.id,
                    onBack = { navController.popBackStack() },
                    onComplete = { earnedPts ->
                        onUserUpdate(user.copy(points = user.points + earnedPts))
                        navController.popBackStack()
                    }
                )
            }
        }
    }
}
