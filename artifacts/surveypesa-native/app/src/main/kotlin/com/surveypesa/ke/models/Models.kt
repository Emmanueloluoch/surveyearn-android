package com.surveypesa.ke.models

data class User(
    val id: Int,
    val name: String,
    val email: String,
    val phone: String?,
    val points: Int,
    val isActivated: Boolean,
    val isVip: Boolean,
    val referralCode: String?,
    val welcomeSurveyId: Int?
)

data class Question(
    val id: Int,
    val surveyId: Int,
    val text: String,
    val type: String,
    val options: String?,
    val orderIndex: Int,
    val required: Boolean
)

data class Survey(
    val id: Int,
    val title: String,
    val description: String?,
    val reward: Int,
    val isPublished: Boolean,
    val questions: List<Question>?
)

data class Completion(
    val surveyId: Int,
    val completedAt: String
)

data class Withdrawal(
    val id: Int,
    val userId: Int,
    val amount: Int,
    val phone: String,
    val status: String,
    val createdAt: String
)

data class LoginRequest(val email: String, val password: String)

data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String,
    val referralCode: String?
)

data class AuthResponse(val user: User)

data class AnswerPayload(val questionId: Int, val answer: String)

data class ResponsePayload(val userId: Int, val answers: List<AnswerPayload>)

data class ResponseResult(val pointsEarned: Int, val newTotal: Int)

data class WithdrawalRequest(val userId: Int, val amount: Int, val phone: String)

data class UpdateProfileRequest(val email: String?, val phone: String?)
