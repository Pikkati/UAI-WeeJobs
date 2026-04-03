package com.facebook.react

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

open class BundleHermesCTask : DefaultTask() {

    @TaskAction
    fun bundleHermes() {
        println("Executing BundleHermesCTask")
        // Placeholder logic for the task
    }
}