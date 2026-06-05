import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class NasaPowerRequest {


    public static String requisitarDadosCidade(Cidade cidade){
        String endereco =
                "https://power.larc.nasa.gov/api/temporal/climatology/point" +
                        "?parameters=ALLSKY_SFC_SW_DWN" +
                        "&community=RE" +
                        "&longitude=" + cidade.getLongitude() +
                        "&latitude=" + cidade.getLatitude() +
                        "&format=JSON";


        HttpClient client = HttpClient.newHttpClient(); // Cria um cliente HTTP
        HttpRequest request = HttpRequest.newBuilder() // Define qual endereço será requisitado
                .uri(URI.create(endereco))
                .build();
        HttpResponse<String> response = null;
        try {
            response = client
                    .send(request, HttpResponse.BodyHandlers.ofString()); // Faz a requisição e armazena no response
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        String json = response.body();
        return json;
    }
}
