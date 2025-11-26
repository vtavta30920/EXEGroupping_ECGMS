// Custom hook for managing course data
'use client'

import { useState, useEffect } from 'react'
import type { Course } from '@/lib/types'
import { CourseService } from '@/lib/api/courseService'

export function useCourseData() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const coursesData = await CourseService.getCourses()
      setCourses(coursesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const getCourseById = async (courseId: string) => {
    try {
      setError(null)
      const course = await CourseService.getCourseById(courseId)
      return course
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course')
      return null
    }
  }

  const createCourse = async (course: Omit<Course, 'courseId'>) => {
    try {
      setError(null)
      const newCourse = await CourseService.createCourse(course)
      setCourses(prev => [...prev, newCourse])
      return newCourse
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
      throw err
    }
  }

  return {
    courses,
    loading,
    error,
    loadCourses,
    getCourseById,
    createCourse,
    refetch: loadCourses
  }
}
