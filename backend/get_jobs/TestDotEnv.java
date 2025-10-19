import io.github.cdimascio.dotenv.Dotenv;

public class TestDotEnv {
    public static void main(String[] args) {
        try {
            Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

            String securityEnabled = dotenv.get("SECURITY_ENABLED", "true");
            System.out.println("SECURITY_ENABLED = " + securityEnabled);
            System.out.println("Boolean.parseBoolean(securityEnabled) = " + Boolean.parseBoolean(securityEnabled));

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
