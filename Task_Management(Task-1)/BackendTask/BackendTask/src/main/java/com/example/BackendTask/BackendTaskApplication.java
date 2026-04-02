package com.example.BackendTask;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendTaskApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendTaskApplication.class, args);

	}

//	@Bean
//	public CommandLineRunner run(UserRepository repo) {
//		return args -> {
//
//			User user = new User();
//
//			user.setName("SujayBabu");
//			user.setEmail("sujay@gmail.com");
//			user.setPasswordHash("123");
//
//			user.setRole(Role.USER);
//			user.setStatus(Status.ACTIVE);
//
//			user.setCreatedAt(LocalDateTime.now());
//
//			repo.save(user);
//
//			System.out.println("✅ User inserted successfully!");
//		};
//	}
}