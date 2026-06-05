public class Cidade {
    private String nome;
    private double longitude;
    private double latitude;
    private double irradiacao;

    public Cidade(String nome, double longitude, double latitude) {
        this.nome = nome;
        this.longitude = longitude;
        this.latitude = latitude;
    }

    public Cidade(String nome, double longitude, double latitude, double irradiacao) {
        this.nome = nome;
        this.longitude = longitude;
        this.latitude = latitude;
        this.irradiacao = irradiacao;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getIrradiacao() {
        return irradiacao;
    }

    public void setIrradiacao(double irradiacao) {
        this.irradiacao = irradiacao;
    }
}
