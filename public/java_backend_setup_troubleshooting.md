# Java Backend Image Processing Setup Troubleshooting

This document provides step-by-step guidance to resolve system memory issues encountered during the Maven build process for the Java backend image processing service.

## Problem: OutOfMemoryError during Maven Build

During the Maven build (`mvn clean install`) of the `backend-java` project, you might encounter `OutOfMemoryError` messages, especially in environments with limited RAM. This typically happens when the Java Virtual Machine (JVM) allocated to Maven runs out of memory.

## Solution: Increase Maven's JVM Memory Allocation

To resolve this, you need to increase the maximum memory allocated to the JVM that Maven uses. This can be done by setting the `MAVEN_OPTS` environment variable.

### Step 1: Determine Current Memory Usage (Optional but Recommended)

Before making changes, you can try to observe the current memory usage during a Maven build. This might be difficult if the build fails quickly, but it can help in understanding the scale of the problem.

### Step 2: Set the `MAVEN_OPTS` Environment Variable

This variable should be set before running any Maven commands. The value typically includes `-Xmx` to set the maximum heap size and `-XX:MaxPermSize` (for older JVMs) or `-XX:MaxMetaspaceSize` (for newer JVMs) for permanent generation or metaspace size.

#### For Windows (Command Prompt or PowerShell):

Open your command prompt or PowerShell and execute the following command:

```powershell
$env:MAVEN_OPTS="-Xmx2048m -XX:MaxMetaspaceSize=512m"
```

*   **`-Xmx2048m`**: Sets the maximum heap size to 2048 megabytes (2GB). Adjust this value based on your system's available RAM and the requirements of your project. Common values are `1024m`, `2048m`, `4096m`, etc.
*   **`-XX:MaxMetaspaceSize=512m`**: Sets the maximum metaspace size to 512 megabytes. This is for Java 8 and later. For Java 7 and earlier, you might use `-XX:MaxPermSize=256m`.

**Note**: This setting is temporary and will only apply to the current session of your command prompt/PowerShell. If you close the window, you'll need to set it again.

#### For Linux/macOS (Bash/Zsh):

Open your terminal and execute the following command:

```bash
export MAVEN_OPTS="-Xmx2048m -XX:MaxMetaspaceSize=512m"
```

**Note**: Similar to Windows, this setting is temporary for the current terminal session.

### Step 3: Run the Maven Build

After setting the `MAVEN_OPTS` environment variable, navigate to your `backend-java` directory and run the Maven build command:

```bash
cd backend-java
mvn clean install
```

### Step 4: Verify the Build

If the memory allocation was sufficient, the Maven build should complete successfully without `OutOfMemoryError` messages. You should see `BUILD SUCCESS` in the console output.

## Persistent `MAVEN_OPTS` Setting (Optional)

If you want to make the `MAVEN_OPTS` setting persistent across all your terminal sessions, you can add the command from Step 2 to your shell's profile file:

*   **Windows (System-wide):** You can set environment variables through the System Properties dialog (Advanced system settings -> Environment Variables). Add `MAVEN_OPTS` as a new system variable.
*   **Linux/macOS:** Add the `export MAVEN_OPTS="..."` line to your `~/.bashrc`, `~/.zshrc`, or `~/.profile` file.

Remember to restart your terminal or source the profile file (`source ~/.bashrc`) for the changes to take effect.

## Further Troubleshooting

If you still encounter `OutOfMemoryError` after increasing `MAVEN_OPTS`:

*   **Increase memory further:** Try increasing `-Xmx` and `-XX:MaxMetaspaceSize` values, but be mindful of your system's physical RAM.
*   **Check for memory leaks in tests:** Sometimes, poorly written unit or integration tests can consume excessive memory. Try running Maven with `-DskipTests` to see if tests are the culprit.
*   **Update Maven and Java:** Ensure you are using recent versions of Maven and Java, as newer versions often have performance improvements and better memory management.

By following these steps, you should be able to resolve common `OutOfMemoryError` issues during your Java backend's Maven build process.