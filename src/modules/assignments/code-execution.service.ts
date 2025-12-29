import axios from 'axios';
import { TestCase } from './assignment.types.js';

interface PistonExecuteResponse {
    run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number; // 0 = success, 1 = error
    }
}

export class CodeExecutionService {
    private static PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

    static async executeCode(language: string, code: string, stdin: string): Promise<PistonExecuteResponse['run']> {
        try {
            // Map our language names to Piston runtime names
            // Piston supports many: python, javascript, typescript, java, c, c++, go, rust
            const runtimeLanguage = language.toLowerCase();

            // Hardcode version for stability or just use latest logic
            const payload = {
                language: runtimeLanguage,
                version: "*", // Use latest available
                files: [
                    {
                        content: code
                    }
                ],
                stdin: stdin,
                // Optional: limiting resources
                // run_timeout: 3000, 
            };

            const response = await axios.post<PistonExecuteResponse>(this.PISTON_API_URL, payload);
            return response.data.run;

        } catch (error) {
            console.error("Executor Error:", error);
            // Return a mock failure response if Piston is down so backend doesn't crash
            return {
                stdout: "",
                stderr: "Execution Service Unavailable",
                output: "Execution Service Unavailable",
                code: 1
            };
        }
    }

    /**
     * Runs code against multiple test cases and returns pass/fail results
     */
    static async validateCodeSubmission(language: string, code: string, testCases: TestCase[]) {
        const results = [];
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];

            // Execute
            const runResult = await this.executeCode(language, code, tc.input);

            // Compare Output (Trim whitespace for safety)
            const actualOutput = runResult.stdout.trim();
            const expectedOutput = tc.expectedOutput.trim();

            const passed = (runResult.code === 0) && (actualOutput === expectedOutput);

            if (passed) passedCount++;

            results.push({
                testCaseIndex: i,
                passed,
                input: tc.isHidden ? "[HIDDEN]" : tc.input,
                expectedOutput: tc.isHidden ? "[HIDDEN]" : expectedOutput,
                actualOutput: runResult.stdout || runResult.stderr, // Show error if any
                error: runResult.stderr
            });
        }

        return {
            results,
            passedCount,
            totalTestCases: testCases.length,
            scorePercent: (testCases.length > 0) ? (passedCount / testCases.length) : 0
        };
    }
}
