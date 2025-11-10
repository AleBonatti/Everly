'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Lock, ArrowLeft, Mail, UserCircle2, AlertCircle, CheckCircle } from 'lucide-react'
import { getUserProfile, updateUserProfile, updateUserPassword } from '@/lib/services/user'
import type { UserProfile } from '@/lib/services/user'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loader from '@/components/ui/Loader'

export default function AccountPage() {
  const router = useRouter()

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserProfile()
        if (data) {
          setProfile(data)
          setFullName(data.fullName || '')
          setEmail(data.email)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
        setError(errorMessage)
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() && !email.trim()) return

    try {
      setIsUpdatingProfile(true)
      setProfileSuccess(false)
      const updatedProfile = await updateUserProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      })
      setProfile(updatedProfile)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      console.error('Error updating profile:', err)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validation
    if (!newPassword.trim()) {
      setPasswordError('Password is required')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      setIsUpdatingPassword(true)
      await updateUserPassword({ newPassword })
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
      setPasswordError(errorMessage)
      console.error('Error updating password:', err)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" text="Loading your profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container-custom flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-2xl space-y-6"
        >
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Profile Section */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-sky-100 p-2">
                <User className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                <p className="text-sm text-slate-600">Update your personal details</p>
              </div>
            </div>

            {profileSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Profile updated successfully!</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<UserCircle2 className="h-5 w-5" />}
                fullWidth
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-5 w-5" />}
                fullWidth
                required
              />
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingProfile || (!fullName.trim() && !email.trim())}
                  loading={isUpdatingProfile}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                <p className="text-sm text-slate-600">Update your account password</p>
              </div>
            </div>

            {passwordSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Password updated successfully!</p>
                </div>
              </motion.div>
            )}

            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{passwordError}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
                fullWidth
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
                fullWidth
                required
              />
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                  loading={isUpdatingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Account Info */}
          {profile && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Account Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">User ID:</dt>
                  <dd className="font-mono text-xs text-slate-900">{profile.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Member since:</dt>
                  <dd className="text-slate-900">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
