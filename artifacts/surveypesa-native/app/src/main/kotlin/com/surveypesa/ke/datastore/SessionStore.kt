package com.surveypesa.ke.datastore

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.surveypesa.ke.models.User
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "session")

class SessionStore(private val context: Context) {

    private val gson = Gson()

    companion object {
        val USER_KEY = stringPreferencesKey("user")
    }

    val userFlow: Flow<User?> = context.dataStore.data.map { prefs ->
        prefs[USER_KEY]?.let { gson.fromJson(it, User::class.java) }
    }

    suspend fun saveUser(user: User) {
        context.dataStore.edit { it[USER_KEY] = gson.toJson(user) }
    }

    suspend fun clearUser() {
        context.dataStore.edit { it.remove(USER_KEY) }
    }
}
