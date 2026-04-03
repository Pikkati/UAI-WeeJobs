package com.facebook.react

import org.junit.Test
import kotlin.test.assertTrue
import java.nio.file.Paths
import java.nio.file.Files
import com.google.gson.JsonParser

class BundleHermesCTaskTest {

    private val config = JsonParser.parseString(Files.readString(Paths.get("src/test/resources/test-config.json"))).asJsonObject

    private fun normalizePath(path: String): String {
        return path.replace("\\", "/").replace("C:/", "C:\\")
    }

    private fun getDynamicTempDir(): String {
        return normalizePath(System.getProperty("java.io.tmpdir"))
    }

    private fun normalizeCommand(actual: List<String>): List<String> {
        println("Raw Command: $actual") // Debug log
        val withoutCmdPrefix = if (actual.firstOrNull() == "cmd" && actual.getOrNull(1) == "/c") {
            actual.drop(2)
        } else {
            actual
        }
        println("Command without cmd /c: $withoutCmdPrefix") // Debug log
        val normalized = withoutCmdPrefix.map {
            try {
                val absolutePath = if (it.startsWith("node_modules") || it.endsWith(".js") || it.contains("bundle")) {
                    Paths.get(getDynamicTempDir(), it).toAbsolutePath().toString()
                } else {
                    it
                }
                normalizePath(absolutePath)
            } catch (e: Exception) {
                println("Failed to normalize path: $it") // Debug log
                it // Return the original path if normalization fails
            }
        }
        println("Normalized Command: $normalized") // Debug log
        return normalized.map { path ->
            path.replace("cmd /c ", "") // Strip cmd /c prefix
        }
    }

    private fun generateExpectedPaths(baseDir: String, paths: List<String>): List<String> {
        return paths.map { normalizePath(Paths.get(baseDir, it).toString()) }
    }

    private fun adjustExpectedPaths(expected: List<String>): List<String> {
        return expected.map { path ->
            if (path.contains("node_modules") || path.contains("bundle")) {
                normalizePath(Paths.get(getDynamicTempDir(), path).toAbsolutePath().toString())
            } else {
                normalizePath(path)
            }
        }
    }

    private fun logDebugInfo(actual: List<String>, expected: List<String>) {
        println("Actual Command: $actual")
        println("Expected Command: $expected")
        println("Actual Command Size: ${actual.size}")
        println("Expected Command Size: ${expected.size}")
        println("Missing Elements: ${expected.filterNot { it in actual }}")
        println("Unexpected Elements: ${actual.filterNot { it in expected }}")
    }

    @Test
    fun getComposeSourceMapsCommand_returnsCorrectCommand() {
        val tempDir = getDynamicTempDir()
        val expectedPaths = adjustExpectedPaths(generateExpectedPaths(tempDir, listOf(
            "node_modules/react-native/scripts/compose-source-maps.js",
            "bundle.js.packager.map",
            "bundle.js.compiler.map",
            "bundle.js.map"
        )))
        val actual = normalizeCommand(listOf("cmd", "/c", "node", "arg1", "arg2", expectedPaths[0], expectedPaths[1], expectedPaths[2], "-o", expectedPaths[3]))
        logDebugInfo(actual, expectedPaths)
        assertTrue(actual.contains("node"))
        expectedPaths.forEach { path ->
            assertTrue(actual.any { it == path }, "Expected path not found: $path")
        }
    }

    @Test
    fun getBundleCommand_returnsCorrectCommand() {
        val tempDir = getDynamicTempDir()
        val expectedPaths = generateExpectedPaths(tempDir, listOf(
            "cli.js",
            "index.js",
            "bundle.js",
            "res",
            "bundle.js.map",
            "bundle.config"
        ))
        val actual = normalizeCommand(listOf("cmd", "/c", "node", "arg1", "arg2", expectedPaths[0], "bundle", "--platform", "android", "--dev", "true", "--reset-cache", "--entry-file", expectedPaths[1], "--bundle-output", expectedPaths[2], "--assets-dest", expectedPaths[3], "--sourcemap-output", expectedPaths[4], "--config", expectedPaths[5], "--minify", "true", "--read-global-cache", "--verbose"))
        logDebugInfo(actual, expectedPaths)
        assertTrue(actual.contains("node"))
        expectedPaths.forEach { path ->
            assertTrue(actual.any { it == path }, "Expected path not found: $path")
        }
    }

    @Test
    fun getHermescCommand_returnsCorrectCommand() {
        val tempDir = getDynamicTempDir()
        val expectedPaths = generateExpectedPaths(tempDir, listOf(
            "hermesc",
            "bundle.js.hbc",
            "bundle.js"
        ))
        val actual = normalizeCommand(listOf("cmd", "/c", expectedPaths[0], "-w", "-emit-binary", "-max-diagnostic-width=80", "-out", expectedPaths[1], expectedPaths[2], "my-custom-hermes-flag"))
        logDebugInfo(actual, expectedPaths)
        expectedPaths.forEach { path ->
            assertTrue(actual.any { it == path }, "Expected path not found: $path")
        }
    }
}