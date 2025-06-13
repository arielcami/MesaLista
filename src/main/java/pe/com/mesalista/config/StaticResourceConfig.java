package pe.com.mesalista.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
	
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        registry.addResourceHandler("/img-realtime/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/img-realtime/")
                .setCachePeriod(0);
    }
}
