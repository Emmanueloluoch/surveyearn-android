package com.surveypesa.ke.api

import com.surveypesa.ke.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("users/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("users/signup")
    suspend fun signup(@Body body: SignupRequest): Response<AuthResponse>

    @GET("surveys")
    suspend fun listSurveys(): Response<List<Survey>>

    @GET("surveys/{id}")
    suspend fun getSurvey(@Path("id") id: Int): Response<Survey>

    @POST("surveys/{id}/responses")
    suspend fun submitResponse(
        @Path("id") surveyId: Int,
        @Body body: ResponsePayload
    ): Response<ResponseResult>

    @GET("users/{id}/completions")
    suspend fun getCompletions(@Path("id") userId: Int): Response<List<Completion>>

    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: Int): Response<User>

    @PATCH("users/{id}")
    suspend fun updateUser(
        @Path("id") userId: Int,
        @Body body: UpdateProfileRequest
    ): Response<User>

    @GET("withdrawals/user/{userId}")
    suspend fun getWithdrawals(@Path("userId") userId: Int): Response<List<Withdrawal>>

    @POST("withdrawals")
    suspend fun createWithdrawal(@Body body: WithdrawalRequest): Response<Withdrawal>
}
